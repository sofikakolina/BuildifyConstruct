// import Kanban from "@/components/dashboard/project/tasks/Kanban"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";
import KanbanBoard from "@/components/dashboard/project/tasks/Kanban";
export const metadata = { title: 'Tasks' }
export default async function ListPage() {
    const session = await getServerSession(authOptions);
    return <KanbanBoard session={session}/>
}