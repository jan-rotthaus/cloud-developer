import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const logger = createLogger('todos');

const todosAccess = new TodosAccess();
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting todos', {
        userId
    });
    return todosAccess.getTodos(userId);
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

    logger.info('Creating todo', {
        userId,
        createTodoRequest
    });

    const todoId: string = uuid.v4();
    const createdAt: string = new Date().toISOString();

    return await todosAccess.createOrUpdateTodo({
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    });
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {

    logger.info('Updating todo', {
        userId,
        todoId,
        updateTodoRequest
    });

    const oldTodo = await todosAccess.getTodo(userId, todoId);

    if (!oldTodo) return null;

    return await todosAccess.createOrUpdateTodo({
        ...oldTodo,
        ...updateTodoRequest
    });
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info('Deleting todo', {
        userId,
        todoId
    });
    return await todosAccess.deleteTodo(userId, todoId);
}

export function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
}
