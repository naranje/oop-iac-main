import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import { ILambdaDatabaseConfiguration } from './lambda-database-configuration-interface';
import { BaseLambdaConstruct } from '../../base-lambda-construct';

export interface LambdaDatabaseConfigurationProps {
    dynamoDbTable: dynamo.ITable;
    environmentVariableName: string;
}

export class LambdaDynamoDbDatabaseConfiguration implements ILambdaDatabaseConfiguration {

    private readonly dynamoDbTable: dynamo.ITable;
    private readonly environmentVariableName: string;
    
    constructor(config: LambdaDatabaseConfigurationProps) {
        this.dynamoDbTable = config.dynamoDbTable;
        this.environmentVariableName = config.environmentVariableName;
    }

    configureLambdaDatabase(lambdaFunction: BaseLambdaConstruct): void {
        lambdaFunction.addEnvironment(this.environmentVariableName, this.dynamoDbTable.tableName);
        this.dynamoDbTable.grantReadWriteData(lambdaFunction);
    }
}