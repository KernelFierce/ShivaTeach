
'use client'

export { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
export { useUser, useAuth, useFirestore } from '@/firebase/provider';
export { doc, setDoc } from 'firebase/firestore';
export { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
