import { BaseLambdaConstruct } from '../../base-lambda-construct';

export interface ILambdaLayerConfiguration {
    configureLambdaLayer(lambdaFunction: BaseLambdaConstruct): void;
}