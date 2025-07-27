import RoomCanvas from "../../../components/Roomcanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;
    return <RoomCanvas roomId={roomId} />
}