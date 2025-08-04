// Test WhatsApp message via Evolution API
const fetch = require('node-fetch');

async function testEvolutionMessage() {
  const apiUrl = 'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io';
  const apiKey = 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7';
  const instanceName = 'lpgapp';

  // Test message to send
  const testMessage = {
    number: '+8801334117987', // Connected WhatsApp number (same as instance)
    text: `🧪 *টেস্ট মেসেজ*

এটি একটি টেস্ট মেসেজ LPG ডিস্ট্রিবিউটর সিস্টেম থেকে।

✅ Evolution API সফলভাবে কাজ করছে!

সময়: ${new Date().toLocaleString('bn-BD')}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
  };

  console.log('🚀 Sending test message via Evolution API...');
  console.log(`📱 To: ${testMessage.number}`);

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(testMessage),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Message sent successfully!');
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Failed to send message');
      console.log('📋 Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
}

testEvolutionMessage();
