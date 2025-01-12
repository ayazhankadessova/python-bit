// // lib/firebase-admin.ts
// import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
// import { getAuth } from 'firebase-admin/auth'

// export const initAdmin = () => {
//   const apps = getApps()

//   if (!apps.length) {
//     const serviceAccount = {
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     }

//     initializeApp({
//       credential: cert(serviceAccount),
//     })
//   }

//   return getAuth()
// }

// // Export singleton instance
// export const adminAuth = initAdmin()
