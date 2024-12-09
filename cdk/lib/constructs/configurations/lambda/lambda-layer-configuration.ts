import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ILambdaLayerConfiguration } from './lambda-layer-configuration-interface';
import { BaseLambdaConstruct } from '../../base-lambda-construct';

export interface LambdaLayerConfigurationProps {
    layerName: string;
    codePath: string;
    compatibleRuntimes?: lambda.Runtime[];
    description: string;
}

export class LambdaLayerConfiguration implements ILambdaLayerConfiguration {
    private readonly layerName: string;
    private readonly codePath: string;
    private readonly compatibleRuntimes: lambda.Runtime[];
    private readonly description: string;
    
    constructor(config: LambdaLayerConfigurationProps) {
        this.layerName = config.layerName;
        this.codePath = config.codePath;
        this.compatibleRuntimes = config.compatibleRuntimes || [lambda.Runtime.NODEJS_18_X];
        this.description = config.description;
    }

    configureLambdaLayer(lambdaFunction: BaseLambdaConstruct): void {
        const layer = new lambda.LayerVersion(lambdaFunction, this.layerName, {
            code: lambda.Code.fromAsset(this.codePath),
            compatibleRuntimes: this.compatibleRuntimes,
            description: this.description,
            layerVersionName: this.layerName,
        });
        
        lambdaFunction.addLayers(layer);
    }
}