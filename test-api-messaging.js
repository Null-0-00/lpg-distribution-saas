// Test the Evolution API setup via the API endpoint
const fetch = require('node-fetch');

async function testAPIMessaging() {
  console.log('🧪 Testing Evolution API setup endpoint...');

  try {
    // Test sending a message via the API
    const testData = {
      phoneNumber: '+8801334117987', // Connected WhatsApp number
    };

    console.log('📱 Testing API with phone:', testData.phoneNumber);

    const response = await fetch(
      'http://localhost:3007/api/messaging/evolution/setup',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'next-auth.session-token=your-session-token', // Replace with actual session
        },
        body: JSON.stringify(testData),
      }
    );

    const result = await response.json();

    console.log('📋 API Response Status:', response.status);
    console.log('📋 API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Also test manual message sending
async function testDirectMessage() {
  console.log('📱 Testing direct WhatsApp message with Bengali text...');

  const apiUrl = 'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io';
  const apiKey = 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7';
  const instanceName = 'lpgapp';

  const receivablesMessage = {
    number: '+8801334117987',
    text: `🔔 *বকেয়া আপডেট*

গ্রাহক: BAOBY
এলাকা: Sample Area

পুরাতন বকেয়া: ০ টাকা
নতুন বকেয়া: ৫০২ টাকা
পরিবর্তন: +৫০২ টাকা

নগদ বকেয়া: ৫০০ টাকা
সিলিন্ডার বকেয়া: ২ টি

সময়: ${new Date().toLocaleString('bn-BD')}
কারণ: Test receivables update

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
  };

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(receivablesMessage),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Receivables message sent successfully!');
      console.log('📋 Message ID:', result.key?.id);
      console.log('📋 Status:', result.status);
    } else {
      console.log('❌ Failed to send receivables message');
      console.log('📋 Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error sending receivables message:', error.message);
  }
}

// Run both tests
async function runTests() {
  await testDirectMessage();
  console.log('\n' + '='.repeat(50) + '\n');
  await testAPIMessaging();
}

runTests();
