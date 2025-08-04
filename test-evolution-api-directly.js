// Test Evolution API directly to diagnose the issue
const fetch = require('node-fetch');

async function testEvolutionAPI() {
  try {
    console.log('🧪 Testing Evolution API directly...\n');

    const testMessage = {
      number: '+8801793536151',
      text: `🧪 *API টেস্ট*

সরাসরি Evolution API টেস্ট।

সময়: ${new Date().toLocaleString('bn-BD')}

*LPG Distributor System*`,
    };

    console.log('📤 Sending test message:');
    console.log('Phone:', testMessage.number);
    console.log('Message:', testMessage.text.substring(0, 50) + '...');

    const response = await fetch(
      'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/message/sendText/lpgapp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
        },
        body: JSON.stringify(testMessage),
      }
    );

    console.log('\n📡 API Response:');
    console.log('Status:', response.status, response.statusText);

    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Evolution API is working correctly!');
      console.log(`📋 Message ID: ${result.key?.id}`);
    } else {
      console.log('❌ Evolution API returned an error');
      console.log('This explains why the payment messages are failing');
    }

    // Test API status
    console.log('\n🔍 Testing API instance status...');
    try {
      const statusResponse = await fetch(
        'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/instance/connectionState/lpgapp',
        {
          method: 'GET',
          headers: {
            apikey: 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
          },
        }
      );

      const statusResult = await statusResponse.json();
      console.log('Instance status:', JSON.stringify(statusResult, null, 2));
    } catch (statusError) {
      console.log('Status check failed:', statusError.message);
    }
  } catch (error) {
    console.error('❌ Error testing Evolution API:', error.message);
  }
}

testEvolutionAPI();
