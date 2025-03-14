import React, { useMemo } from "react";
import { Table } from "../../Table";
import { translations } from "../../utils/translations";

const TaskList = ({ tasks, handleMarkAsSeenTask, userList }) => {
    const language = localStorage.getItem("language") || "RO";

    const columns = useMemo(
        () => [
            {
                header: "ID",
                accessorKey: "id",
            },
            {
                header: "Task pentru ticket",
                accessorKey: "ticket_id",
            },
            {
                header: "Creat de",
                accessorKey: "created_by",
            },
            {
                header: "Pentru",
                accessorKey: "created_for",
                cell: ({ row }) => {
                    const assignedUser = userList.find(user => user.id === row.original.created_for);
                    return assignedUser ? `${assignedUser.name} ${assignedUser.surname}` : `ID: ${row.original.created_for}`;
                },
            },
            {
                header: "Descriere",
                accessorKey: "description",
            },
            {
                header: "Data",
                accessorKey: "scheduled_time",
                cell: ({ row }) => new Date(row.original.scheduled_time).toLocaleString(),
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => (
                    <span className={row.original.status ? "seen" : "unseen"}>
                        {row.original.status
                            ? ["Văzut"][language]
                            : ["Nevăzut"][language]}
                    </span>
                ),
            },
            {
                header: "Acțiune",
                accessorKey: "action",
                cell: ({ row }) =>
                    !row.original.status && (
                        <button onClick={() => handleMarkAsSeenTask(row.original.id)}>
                            {"Marchează"}
                        </button>
                    ),
            },
        ],
        [language, userList, handleMarkAsSeenTask]
    );

    return <Table data={tasks} columns={columns} loading={false} select={[]} />;
};

export default TaskList;