/**
 * AlimTalk Service (Solapi Integration Stub)
 * 
 * TODO: Install solapi-nodejs SDK
 * npm install solapi-nodejs
 */

// import { SolapiMessageService } from "solapi-nodejs";

// const messageService = new SolapiMessageService(
//   process.env.NEXT_PUBLIC_SOLAPI_API_KEY || "",
//   process.env.NEXT_PUBLIC_SOLAPI_API_SECRET || ""
// );

export const sendCheckinAlimTalk = async (booking: any) => {
  const checkinUrl = `${window.location.origin}/checkin?id=${booking.id}`;
  
  console.log(`Sending AlimTalk to ${booking.phone || 'N/A'}`);
  console.log(`Link: ${checkinUrl}`);

  // Mock implementation for now
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("AlimTalk Request Sent (Mock)");
      resolve({ success: true });
    }, 1000);
  });
};
