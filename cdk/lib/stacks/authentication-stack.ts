import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface AuthenticationStackProps extends cdk.StackProps {
    authenticationDomainPrefix: string;
    applicationUrl: string;
}

export class AuthenticationStack extends cdk.Stack {
    private readonly userPool: cognito.UserPool;
    private readonly userPoolClient: cognito.UserPoolClient;
    private readonly userPoolDomain: cognito.UserPoolDomain;

    constructor(scope: Construct, id: string, props: AuthenticationStackProps) {
        super(scope, id, props);

        this.userPool = new cognito.UserPool(this, "TodoApplicationUserPool", {
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
            removalPolicy: cdk.RemovalPolicy.DESTROY
          });
  
          this.userPoolClient = this.userPool.addClient("TodoApplicationUserPoolClient", {
            oAuth: {
              flows: {
                authorizationCodeGrant: true,
              },
              scopes: [ cognito.OAuthScope.OPENID ],
              callbackUrls: [ props.applicationUrl ],
              logoutUrls: [ props.applicationUrl ]
            }
          });

          this.userPoolDomain = this.userPool.addDomain("TodoApplicationCognitoDomain", {
            cognitoDomain: {
              domainPrefix: props.authenticationDomainPrefix,
            },
          });
    }

    public getUserPool(): cognito.IUserPool {
        return this.userPool;
    }

    public getUserPoolClientId(): string {
        return this.userPoolClient.userPoolClientId;
    }

    public getUserPoolDomain(): string {
        return this.userPoolDomain.domainName;
    }
}
