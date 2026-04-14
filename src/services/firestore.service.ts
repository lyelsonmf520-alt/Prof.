// Firestore has been replaced with SQLite-backed REST API.
// This module provides REST wrappers with the same signature
// as the original Firestore service so hooks don't need to change structure.

import { apiFetch } from './api.service'

export async function getCollection<T>(
  _uid: string,
  colName: string
): Promise<(T & { id: string })[]> {
  return apiFetch<(T & { id: string })[]>(`/api/data/${colName}`)
}

export async function addToCollection(
  _uid: string,
  colName: string,
  data: Record<string, unknown>
): Promise<string> {
  const res = await apiFetch<{ id: string }>(`/api/data/${colName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.id
}

export async function updateInCollection(
  _uid: string,
  colName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  await apiFetch(`/api/data/${colName}/${docId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteFromCollection(
  _uid: string,
  colName: string,
  docId: string
): Promise<void> {
  await apiFetch(`/api/data/${colName}/${docId}`, { method: 'DELETE' })
}

export async function setDocument(
  _uid: string,
  colName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  await apiFetch(`/api/data/${colName}/${docId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
