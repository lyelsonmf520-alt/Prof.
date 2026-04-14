import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export function userCol(uid: string, ...segments: string[]) {
  return collection(db, 'users', uid, ...segments)
}

export function userDoc(uid: string, ...segments: string[]) {
  return doc(db, 'users', uid, ...segments)
}

export async function getCollection<T extends DocumentData>(
  uid: string,
  colName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const col = userCol(uid, colName)
  const q = constraints.length > 0 ? query(col, ...constraints) : query(col, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }))
}

export async function addToCollection(
  uid: string,
  colName: string,
  data: DocumentData
): Promise<string> {
  const col = userCol(uid, colName)
  const ref = await addDoc(col, { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateInCollection(
  uid: string,
  colName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  const ref = userDoc(uid, colName, docId)
  await updateDoc(ref, data)
}

export async function deleteFromCollection(
  uid: string,
  colName: string,
  docId: string
): Promise<void> {
  const ref = userDoc(uid, colName, docId)
  await deleteDoc(ref)
}

export async function setDocument(
  uid: string,
  colName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  const ref = userDoc(uid, colName, docId)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}
