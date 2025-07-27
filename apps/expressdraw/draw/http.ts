import axios from "axios";

export async function getEistingShapes(roomId: string) {
    const res = await axios.get(`http://localhost:3002/message/${roomId}`);
    const message = res.data.messages;
    

    const shapes = message.map((x: { message: string }) => {
        const messagedata = JSON.parse(x.message);
        return messagedata.shape;
    })
    return shapes;
}