from shared.events import parse_sns_message, validate_document_sent


def handler(event, context):
    processed_count = 0

    for record in event["Records"]:
        document_event = parse_sns_message(record)
        validate_document_sent(document_event)
        processed_count += 1

    return {
        "statusCode": 200,
        "processed_count": processed_count,
    }