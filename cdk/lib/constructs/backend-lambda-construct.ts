import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ILambdaLayerConfiguration } from './configurations/lambda/lambda-layer-configuration-interface';
import { ILambdaDatabaseConfiguration } from './configurations/lambda/lambda-database-configuration-interface';
import { ILambdaPermissionsConfiguration } from './configurations/lambda/lambda-permissions-configuration-interface';
import { BaseLambdaConstruct } from './base-lambda-construct';

export interface LambdaConstructProps {
    layerConfig: ILambdaLayerConfiguration;
    databaseConfig: ILambdaDatabaseConfiguration;
    permissionsConfig: ILambdaPermissionsConfiguration;
    code: lambda.Code;
}

export class BackendLambdaConstruct extends BaseLambdaConstruct implements ILambdaLayerConfiguration, ILambdaDatabaseConfiguration, ILambdaPermissionsConfiguration {
    private readonly layerConfig: ILambdaLayerConfiguration;
    private readonly databaseConfig: ILambdaDatabaseConfiguration;
    private readonly permissionsConfig: ILambdaPermissionsConfiguration;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        
        super(scope, id, {
            code: props.code
          });

          this.layerConfig = props.layerConfig;
          this.databaseConfig = props.databaseConfig;
          this.permissionsConfig = props.permissionsConfig;

          this.configureLambdaLayer(this);
          this.configureLambdaDatabase(this);
          this.configureLambdaPermissions(this);
    }

    public configureLambdaLayer(lambdaFunction: BackendLambdaConstruct): void {
        this.layerConfig.configureLambdaLayer(lambdaFunction);
    }

    public configureLambdaDatabase(lambdaFunction: BackendLambdaConstruct): void {
        this.databaseConfig.configureLambdaDatabase(lambdaFunction);
    } 

    public configureLambdaPermissions(lambdaFunction: BackendLambdaConstruct): void {
        this.permissionsConfig.configureLambdaPermissions(lambdaFunction);
    }
}