import { SNSEvent, SNSHandler } from 'aws-lambda'
import 'source-map-support/register'

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
}
