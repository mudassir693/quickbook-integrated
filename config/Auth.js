import OAuthClient from 'intuit-oauth';
import QuickBooks from 'node-quickbooks';
import tokenDb from '../tokenDB.js';

let oauthClient = null;

export const getAuthUrl = async (req, res) => {
  oauthClient = new OAuthClient({
    clientId: process.env.ClientID,
    clientSecret: process.env.ClientSecret,
    environment: "sandbox",
    redirectUri: "http://localhost:5000/api/auth/callback",
  });

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: 'intuit-test',
  });
  
  res.send(authUri);
};

export const callbackUrl = (req, res) => {
  oauthClient.createToken(req.url)
    .then((authResponse) => {
      const tokenData = authResponse.getJson();
      tokenDb.push(tokenData);
      console.log('OAuth Response:', tokenData);
    })
    .catch((error) => {
      console.error('Error during OAuth token creation:', error);
    });

  res.send('');
};

export const getOauth = (req, res) => {
  try {
    return res.status(200).json({ data: tokenDb, error: false });
  } catch (error) {
    return res.status(500).json({ data: "Error fetching OAuth data", error: true });
  }
};

export const refreshToken = (req, res) => {
  oauthClient.refresh()
    .then((authResponse) => {
      const refreshedToken = authResponse.getJson();
      console.log('Refreshed OAuth Token:', JSON.stringify(refreshedToken));
      res.send(JSON.stringify(refreshedToken, null, 2));
    })
    .catch((error) => {
      console.error('Error refreshing OAuth token:', error);
    });
};

export const getQuickBooksInstance = (token) => {
  const accessToken = token[0]?.access_token;
  const refreshToken = token[0]?.refresh_token;

  if (!accessToken) {
    console.error('Access token is missing');
    return null;
  }

  return new QuickBooks(
    process.env.ClientID,
    process.env.ClientSecret,
    accessToken,
    true, 
    process.env.CompanyId,
    true, 
    true, 
    null, 
    '2.0', 
    refreshToken 
  );
};
