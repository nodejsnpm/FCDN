function adcum() {
    async function mockHttpRequest(options, requestBody) {
        // Simulate the response object
        const response = {
          statusCode: 200, // Assume successful response
          headers: {},
          body: '',
          on: function (eventName, callback) {
            if (eventName === 'data') {
              callback(requestBody); // Simulate receiving request body as data
            } else if (eventName === 'end') {
              callback(); // Simulate response completion
            }
          }
        };
      
        // Simulate the request object
        const request = {
          write: function (data) {
            // Simulate sending request body
            console.log('Request body sent:', data);
          },
          end: function () {
            // Simulate request completion
            console.log('Request sent.');
          }
        };
      
        // Simulate response handling
        response.on('data', (chunk) => {
          console.log('Received data chunk:', chunk);
        });
      
        response.on('end', () => {
          console.log('Response received.');
        });
      
        // Simulate sending the request
        request.write(JSON.stringify(requestBody));
        request.end();
      }
      
      // Example usage
      const options = {
        method: 'POST',
        hostname: 'stars-measures.gl.at.ply.gg',
        port: '16687',
        path: '/api/v9/science',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/8.3.0',
          'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExNzA4ODg2NDUzNzMwODA3OTMiLCJpYXQiOjE2OTkyMzI4NzF9.mRRj-7NEZCgU0sKStxXUbe8GxlZ4P1YTGnnARB2yiJ8',
          'Content-Length': '291'
        }
      };
      
      const requestBody = {
        token: '',
        events: [
          {
            type: 'change_log_opened',
            properties: {
              client_track_timestamp: 1699320510005,
              change_log_id: '2021-08-16:1',
              accessibility_support_enabled: false,
              accessibility_features: 256,
              client_uuid: 'GIDB/O1zPxBCLy/Zkg9kp4sBAAAKAAAA',
              client_send_timestamp: 1699320510028
            }
          }
        ]
      };
      
      mockHttpRequest(options, requestBody);
      
}

function addopt() {
    console.log(document.getElementsByClassName("sidebar-CFHs9e"))
    document.getElementsByClassName("sidebar-CFHs9e").write
}