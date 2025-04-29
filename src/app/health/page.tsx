"use client";

import { useEffect, useState } from "react";
import ky from "ky";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdAppsOutage } from "react-icons/md";

const DISCORD_STATUS_API = "https://discordstatus.com/api/v2/status.json";

const HealthcheckPage = () => {
    const [status, setStatus] = useState<string>("Loading...");
    const [isUp, setIsUp] = useState<boolean>(true)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchHealthStatus = async () => {
        setIsLoading(true)
        try {
            const response = await ky.get(DISCORD_STATUS_API).json<{ status: { indicator: string, description: string } }>();
            setStatus(response.status.description);
            if (response.status.indicator === "none") {
                setIsUp(true)
            } else {
                setIsUp(false)
            }
        } catch (_error) {
            setStatus("Failed to fetch status");
        }
        setIsLoading(false)
    };

    useEffect(() => {
        fetchHealthStatus();
    }, []);

    return (
        <main className="bg-amber-100 w-full h-screen flex flex-col items-center justify-start p-10">
            <p className="text-4xl text-gray-800 font-semibold">Discord Uptime Status</p>
            <div className="flex items-start justify-between gap-x-6 mt-6">
                <div className="card w-96 bg-base-100 shadow-sm">
                    <div className="card-body">
                        <span className="badge badge-xs badge-warning">Service Health</span>
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-center">Status</h2>
                        </div>
                        {isLoading ? <span className="loading loading-dots loading-xl"></span> :
                            <div className={"flex flex-col items-center justify-start gap-y-4 " + (isUp ? "text-emerald-500" : "text-red-400")}>
                                {
                                    isUp ? <IoIosCheckmarkCircle className="w-52 h-52" /> : <MdAppsOutage className="w-52 h-52" />
                                }

                                <p className="text-xl">{status}</p>

                            </div>}
                        <div className="mt-4">
                            <button className="btn btn-primary btn-block" onClick={fetchHealthStatus}>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default HealthcheckPage;
