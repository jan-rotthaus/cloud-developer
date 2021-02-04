
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJJwxBrI+er1JfMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1yb3R0aGF1cy5ldS5hdXRoMC5jb20wHhcNMjEwMTIwMTQxNjI3WhcN
MzQwOTI5MTQxNjI3WjAkMSIwIAYDVQQDExlkZXYtcm90dGhhdXMuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp1feOW0lQnWw0MPR
IfIU41KRJT6QAoaa/Qy/0fncgxvegMz1tLiJnCx6pWpKawXtiN9+3WVVzkl4v6gA
ZlCJP8Ff85sMpGH/vt0bOc6AQuJHk4iXiFIgQKi2Bbvs8phPJZisUeVp9vFDsPIv
9lV3L8T77szz+R8HsxejiAmAslCKhZq0yW+VltQqQTXpKU0MuaCVatxU0Na4lnGN
cBlu9uYkjzJ99YEtukgF2IisLm/J2QM6NPgVQqPJV6wW3cknRDTVl5zf1SUE6pGo
72Xh4deGu2cF/+IYaE9VXPSsygHqs4FwlmOshy8E9ZXNRcQUIxsYJu5G35/eC5Nm
6kd4SQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRxl5l4IMBx
BE/4KuQwKIIYH3lVBzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ABEwfZw4QXSG8lQE6m1TpOSHVdkMHsEVopIGZudgE7rDdxIJfsG+BPjBjqnZ9YkP
N/qTQqS42n/8YayoBulyDebLgZ1Pp/tdk9RKpP9V1ABZEq2CnxrPkRBMpHUTBXjR
D7LErIA2uZIJomUBNnredE5P+0RL5vmG/lFNF2SISJ+XeV24fwIMUv70venhLTMY
sTuRydaA/tmppSdSZAzXvX6cdhWpJwfmtAhM6SnO1lSOYeivJT1VFXJb1oMEJIsc
fE86LXF6sWslzccobB/xVhBus+W0RF3AjHH4PX7Mt8WwW+Exqh/TWKhkcCEkTr0Q
FfuulT/uuF1RbPKB0dXdKLc=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
