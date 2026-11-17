import localforage from 'localforage'

// Almacenamiento local persistente del navegador (IndexedDB/WebSQL fallback).
// Reemplaza a Drift/SQLite (NativeDatabase) para Flutter Web.
export const db = localforage.createInstance({
  name: 'AIPGestDB',
  version: 1,
  storeName: 'aipgest',
  description: 'Base de datos local offline de AIP Gest',
})

// Claves de almacenamiento
export const STORE = {
  equipos: 'equipos',
  docentes: 'docentes',
  reportCache: 'report_cache',
  syncQueue: 'sync_queue',
  prestamosCache: 'prestamos_cache',
} as const
