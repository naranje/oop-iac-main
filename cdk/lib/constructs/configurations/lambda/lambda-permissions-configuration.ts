import { BaseLambdaConstruct } from '../../base-lambda-construct';
import { ILambdaPermissionsConfiguration } from './lambda-permissions-configuration-interface';

export interface LambdaDatabaseConfigurationProps {
    allowedOrigins: string; 
}

export class LambdaPermissionsConfiguration implements ILambdaPermissionsConfiguration {

    private readonly allowedOrigins: string;
    
    constructor(config: LambdaDatabaseConfigurationProps) {
        this.allowedOrigins = config.allowedOrigins;
    }

    configureLambdaPermissions(lambdaFunction: BaseLambdaConstruct): void {
        lambdaFunction.addEnvironment('ALLOWED_ORIGINS', this.allowedOrigins);
    }
}