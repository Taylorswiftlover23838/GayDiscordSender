const channel_Id = ''; //enter channel_ID
const token = ''; //Enter your discord user token

const fetchMessages = async (before = null) => {
    try {
        const beforeParam = before !== null ? `&before=${before}` : '';
        const url = `https://discord.com/api/v9/channels/${channel_Id}/messages?${beforeParam}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`
            }
        });

        await new Promise(resolve => setTimeout(resolve, 4000));

        if (!response.ok) {
            if (response.staus = 429){
                const responseJson = await response.json();
                const retryAfter = responseJson.retry_after;
                if (retryAfter) {
                    console.error(`Lets wait ${retryAfter} seconds.`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 4000));
                }
            }
            console.error('Failed to fetch messages. Status:', response.status);
            return;
        }

        const messages = await response.json();
        messages.forEach(message => {
            message.embeds.forEach(embed => {
                if (embed.type === 'image') {
                    console.log('embed image:', embed.url);
                    sendMessage(null, embed.url); 
                }
            });
            message.attachments.forEach(attachment => {
                console.log('attachment:', attachment.url);
                sendMessage(attachment.url, null); 
            });
        });
        
        if (messages.length > 0) {
            const oldestMessageId = messages[messages.length - 1].id;
            await fetchMessages(oldestMessageId);
        }
    } catch (error) {
        console.error('Error fetching messages:', error.message);
    }
};

const sendMessage = async (attachment, image) => {
    try {
        const url = "https://discord.com/api/v9/channels/909081602968129587/messages";
        const content = attachment || image; 
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        });

        await new Promise(resolve => setTimeout(resolve, 4000));


        if (!response.ok){
            if (response.status === 429){ 
                const responseJson = await response.json();
                const retryAfter = responseJson.retry_after;
                if (retryAfter) {
                    console.error(`Lets wait ${retryAfter} seconds.`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 4000));
                    await sendMessage(attachment, image);
                }
            } else {
                console.error('Failed to send message. Status:', response.status);
            }
            return;
        }
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}

fetchMessages();