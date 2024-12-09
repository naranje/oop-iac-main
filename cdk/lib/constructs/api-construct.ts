import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IApiAuthorizationConfiguration } from './configurations/api/api-authorization-configuration-interface';
import { IApiDnsConfiguration } from './configurations/api/api-dns-configuration-interface';

export interface ApiConstructProps extends apigateway.RestApiProps {
    apiAuthorizationConfiguration: IApiAuthorizationConfiguration;
    apiDnsConfiguration: IApiDnsConfiguration;
}

export class ApiConstruct extends apigateway.RestApi implements IApiAuthorizationConfiguration, IApiDnsConfiguration {
  private readonly apiAuthorizationConfiguration: IApiAuthorizationConfiguration;
  private readonly apiDnsConfiguration: IApiDnsConfiguration;
  private readonly apiAuthorizer: apigateway.IAuthorizer;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
        super(scope, id, props);
      
        this.apiAuthorizationConfiguration = props.apiAuthorizationConfiguration;
        this.apiDnsConfiguration = props.apiDnsConfiguration;

        this.apiAuthorizer = this.configureApiAuthorization(this);
        this.configureApiDns(this);
    }

    configureApiAuthorization(api: ApiConstruct): apigateway.IAuthorizer {
        return this.apiAuthorizationConfiguration.configureApiAuthorization(api);
    }

    configureApiDns(api: ApiConstruct): void {
        this.apiDnsConfiguration.configureApiDns(api);
    }

    public addApiResource(resourcePath: string, options?: apigateway.ResourceOptions): void {
      this.root.addResource(resourcePath, options);
    }
    
    public addApiAuthorizedResourceIntegration(resourcePath: string, httpMethod: string, integration: apigateway.Integration, options?: apigateway.MethodOptions): void {
      const methodOptions: apigateway.MethodOptions = {
        ...options,
        authorizer: this.apiAuthorizer
      };
      const resource = this.root.getResource(resourcePath);
      if (!resource) {
        throw new Error(`Resource not found for path: ${resourcePath}`);
      }
      resource.addMethod(httpMethod, integration, methodOptions);
    }
}