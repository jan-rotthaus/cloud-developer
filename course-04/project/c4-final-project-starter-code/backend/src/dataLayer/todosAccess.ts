import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todosAccess');

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_INDEX) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting todos', {
            userId
        });

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: true
        }).promise();

        return result.Items as TodoItem[];
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        logger.info('Getting todo', {
            userId, todoId
        });

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise();

        return result.Item as TodoItem;
    }

    async createOrUpdateTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Creating or updating todo', {
            todo
        });

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info('Deleting todo', {
            userId, todoId
        });

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.warn('Creating a local DynamoDB instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
}
