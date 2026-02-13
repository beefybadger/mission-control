import os
import json
import requests

# Business Knowledge Base (The 'Brain' of the Receptionist)
BUSINESS_INFO = """
Name: Elite Plumbing London
Services: Emergency repairs, Leak detection, Boiler servicing.
Price: £80 call-out fee + £60/hr.
Hours: 24/7 Emergency Service.
Booking: Must provide Address and Phone Number.
"""

def generate_response(user_message):
    # This simulates the n8n logic we will eventually deploy
    # It uses Gemini to process the message based on the Business Info
    
    prompt = f"You are an AI receptionist for {BUSINESS_INFO}. " \
             f"Be professional, direct, and try to book an appointment. " \
             f"Always ask for their Phone and Address if they want a booking. " \
             f"User message: {user_message}"
    
    # Using the internal OpenClaw tool style logic to fetch a response
    # (In production, this would be an API call to Gemini)
    return f"[AI RECEPTIONIST]: Hello! I can certainly help with that. {user_message[:10]}... " \
           f"We have an emergency plumber available within 60 minutes. " \
           f"What is your address and phone number so I can dispatch them?"

if __name__ == "__main__":
    # Test Case: A customer panicking at 2 AM
    test_message = "My pipe just burst in the kitchen! Can someone come now?"
    response = generate_response(test_message)
    print(f"CUSTOMER: {test_message}")
    print(response)
