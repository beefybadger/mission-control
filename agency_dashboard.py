import streamlit as st
import json
import os

st.set_page_config(page_title="Baron Agency HQ", page_icon="🦁")

st.title("🦁 Baron Agency: Client Onboarding")

# Sidebar for Navigation
menu = ["Onboard New Client", "Manage Clients", "Settings"]
choice = st.sidebar.selectbox("Menu", menu)

if choice == "Onboard New Client":
    st.subheader("Add a New Business to the Network")
    
    with st.form("onboarding_form"):
        biz_name = st.text_input("Business Name")
        location = st.text_input("Service Area (e.g. Berlin, DE)")
        services = st.text_area("Services (one per line)")
        pricing = st.text_input("Call-out Fee / Basic Pricing")
        hours = st.selectbox("Operating Hours", ["24/7", "9 AM - 5 PM", "Custom"])
        
        submit = st.form_submit_button("Generate AI Brain Profile")
        
        if submit:
            profile = {
                "business_name": biz_name,
                "location": location,
                "services": services.split('\n'),
                "pricing": pricing,
                "operating_hours": hours
            }
            
            # Save to JSON
            filename = f"config/profiles/{biz_name.lower().replace(' ', '_')}.json"
            os.makedirs("config/profiles", exist_ok=True)
            with open(filename, "w") as f:
                json.dump(profile, f, indent=2)
            
            st.success(f"Profile created for {biz_name}! AI Brain is ready for deployment.")

elif choice == "Manage Clients":
    st.subheader("Active Money-Hole Fillers")
    profiles = [f for f in os.listdir("config/profiles") if f.endswith(".json")]
    if profiles:
        for p in profiles:
            with open(f"config/profiles/{p}", "r") as f:
                data = json.load(f)
                st.write(f"### ✅ {data['business_name']}")
                st.write(f"**Area:** {data['location']}")
                st.write(f"**Services:** {', '.join(data['services'])}")
    else:
        st.info("No clients onboarded yet.")
