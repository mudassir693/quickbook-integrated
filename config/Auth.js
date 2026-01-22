import OAuthClient from 'intuit-oauth'
let oauthClient = null;
let oauth2_token_json = null;
import QuickBooks from 'node-quickbooks'

import tokenDb from '../tokenDB.js'

export const getAuthUrl = async(req,res)=>{
    oauthClient = new OAuthClient({
        clientId: process.env.ClientID,
        clientSecret: process.env.ClientSceret,
        environment: "sandbox",
        redirectUri: "http://localhost:5000/api/auth/callback",
      });
      const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting],
        state: 'intuit-test',
      })
    res.send(authUri)
}

export const callbackUrl2 =   (req, res) => {
    oauthClient
        .createToken(req.url)
            .then(function (authResponse) {
                oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                tokenDb.push(authResponse.getJson())
                console.log('waiting for:',authResponse.getJson())
            })
            .catch(function (e) {
                console.error(e);
            });

    res.send('');
};

export const getOauth = (req,res)=>{
    try{
        return res.status(200).json({data:tokenDb,error:false})
    }catch(err){
        return res.status(500).json({data:"error",error:true})
    }
}

export const refreshToken = (req, res) => {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
        res.send(oauth2_token_json);
      })
      .catch(function (e) {
        console.error(e);
      });
  }



export default (token)=>{
    console.log('what happened: ',token[0]?.access_token)
    let qbo = new QuickBooks(process.env.ClientID,
        process.env.ClientSceret,
        token[0]?.access_token,
        true, // no token secret for oAuth 2.0
        process.env.CompanyId,
        true, // use the sandbox?
        true, // enable debugging?
        null, // set minorversion, or null for the latest version
        '2.0', //oAuth version
        token[0]?.refresh_token //refresh token
        );

        return qbo
}
