import {google} from 'googleapis';
const id=process.env.GOOGLE_CLIENT_ID,secret=process.env.GOOGLE_CLIENT_SECRET;
if(!id||!secret)throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your shell.');
// Add http://localhost:4000/oauth2callback to authorized redirect URIs in Google Cloud Console.
const auth=new google.auth.OAuth2(id,secret,'http://localhost:4000/oauth2callback');
console.log('Visit this URL as your designated Google account:');
console.log(auth.generateAuthUrl({access_type:'offline',prompt:'consent',scope:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive.file']}));
console.log('\nAfter authorization, copy the code from the redirect URL query string.');
console.log('Exchange it with: node scripts/google-exchange-code.mjs YOUR_CODE');
