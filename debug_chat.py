
import requests
import json
import uuid

API_URL = "https://p4mgpaaptzeppfuszun4jdn6vy.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-wueqblmnjneb5fn45qxzqj2hfq"
TENANT_ID = "demo-landing"

def test_start_conversation():
    query = """
    mutation StartConversation($input: StartConversationInput!) {
        startConversation(input: $input) {
            conversation {
                conversationId
                tenantId
                state
            }
            response {
                text
                type
            }
        }
    }
    """
    
    variables = {
        "input": {
            "channel": "widget",
            "metadata": json.dumps({"userAgent": "debug-script"})
        }
    }
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "x-tenant-id": TENANT_ID # Some resolvers might expect this header if logic uses it
    }
    
    # Also valid AppSync requests usually just send the query and variables
    # The `extract_appsync_event` in python backend looked for `arguments`, `stash`, `identity` etc.
    # The `startConversation` resolver is likely a Direct Lambda Resolver or uses request mapping.
    # If it uses `lambdaRequest()`, it passes the full structure.
    # The lambda extracts tenantId from `event` -> `extract_appsync_event`.
    # Let's see if passing just the apiKey works. The tenantId is NOT in the input? 
    # Wait, `StartConversationInput` def:
    # input StartConversationInput {
    #   channel: String
    #   metadata: AWSJSON
    # }
    # It DOES NOT have tenantId.
    # So `extract_appsync_event` MUST look for tenantId in `headers` or `request context`.
    # Inspecting `shared/utils.py` again would be useful.
    # But for now, let's try sending the request.
    
    # Note: If the backend extraction relies on `custom:tenantId` in Cognito User, 
    # BUT `startConversation` is `@aws_api_key` (Public), then it MUST rely on a Header or something else.
    # Inspecting `extract_appsync_event` logic showed it checks `event['request']['headers']['x-tenant-id']`? 
    # Or `arguments`?
    
    print(f"Sending request to {API_URL}...")
    try:
        response = requests.post(
            API_URL,
            json={'query': query, 'variables': variables},
            headers=headers
        )
        
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_start_conversation()
