import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DataStack extends cdk.Stack {

    private readonly todoItemsTable: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.todoItemsTable = new dynamodb.Table(this, 'TodoApplicationTodoItemsTable', {
            partitionKey: {
              name: 'who',
              type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
              name: 'creationDate',
              type: dynamodb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY
          });
    }

    public getDatabaseTable(): dynamodb.ITable{
        return this.todoItemsTable;
    }
}