import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface BaseLambdaConstructProps{
    runtime?: lambda.Runtime;
    handler?: string;
    code: lambda.Code;
    memorySize?: number;
    timeout?: cdk.Duration;
}

export class BaseLambdaConstruct extends lambda.Function {
    constructor(scope: Construct, id: string, props: BaseLambdaConstructProps) {
    super(scope, id, {
        runtime: props.runtime ?? lambda.Runtime.NODEJS_18_X,
        handler: props.handler ?? 'index.handler',
        memorySize: props.memorySize ?? 256,
        timeout: props.timeout ?? cdk.Duration.seconds(30),
        code: props.code
        });
    }
}