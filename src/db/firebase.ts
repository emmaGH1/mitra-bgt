import { initializeApp, getApps } from "firebase/app";
import { getFirestore, getDocs, collection, query, orderBy, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

let dbInstance: any = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase Client SDK lazily
export function getFirestoreDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.log("[FIREBASE] firebase-applet-config.json not found.");
      return null;
    }

    const rawConfig = fs.readFileSync(configPath, "utf-8");
    const firebaseConfig = JSON.parse(rawConfig);

    if (!firebaseConfig.projectId || !firebaseConfig.firestoreDatabaseId) {
      console.warn("[FIREBASE] Missing projectId or firestoreDatabaseId in config.");
      return null;
    }

    const apps = getApps();
    const app = apps.length === 0
      ? initializeApp({
          apiKey: firebaseConfig.apiKey,
          authDomain: firebaseConfig.authDomain,
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket,
          messagingSenderId: firebaseConfig.messagingSenderId,
          appId: firebaseConfig.appId,
        })
      : apps[0]!;

    // Access custom named database ID securely via Client SDK
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("[FIREBASE] Successfully initialized Firebase Client SDK for Firestore named DB:", firebaseConfig.firestoreDatabaseId);
    return dbInstance;
  } catch (error) {
    console.error("[FIREBASE] Error initializing Firestore Client SDK:", error);
    dbInstance = null;
    return null;
  }
}

export function isFirestoreConfigured(): boolean {
  return getFirestoreDb() !== null;
}

export async function getTradeLogsFromFirestore(): Promise<any[]> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const path = "trade_logs";
  try {
    const q = query(collection(db, path), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addTradeLogToFirestore(log: any): Promise<void> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const path = `trade_logs/${log.id}`;
  try {
    await setDoc(doc(db, "trade_logs", log.id), {
      id: log.id,
      timestamp: log.timestamp || new Date().toISOString(),
      asset: log.asset,
      action: log.action,
      price: Number(log.price),
      quantity: Number(log.quantity),
      value: Number(log.value),
      rationale: log.rationale || "",
      txHash: log.txHash || "",
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getSignalsFromFirestore(): Promise<any[]> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const path = "signals_log";
  try {
    const q = query(collection(db, path), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addSignalToFirestore(signal: any): Promise<void> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const path = `signals_log/${signal.id}`;
  try {
    await setDoc(doc(db, "signals_log", signal.id), {
      id: signal.id,
      timestamp: signal.timestamp || new Date().toISOString(),
      source: signal.source,
      headline: signal.headline,
      sentiment: signal.sentiment,
      score: Number(signal.score),
      interpretation: signal.interpretation,
      recommendedAllocation: signal.recommendedAllocation,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
