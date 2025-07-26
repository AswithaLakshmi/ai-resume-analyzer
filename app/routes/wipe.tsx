import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        try {
            const files = (await fs.readDir("./")) as FSItem[];
            setFiles(files);
        } catch (err) {
            console.error("Failed to load files:", err);
        }
    };

    useEffect(() => {
        // Load files on mount
        (async () => {
            await loadFiles();
        })();
    }, []);

    useEffect(() => {
        // Redirect unauthenticated users
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    const handleDelete = async () => {
        try {
            await Promise.all(files.map((file) => fs.delete(file.path)));
            await kv.flush();
            await loadFiles(); // refresh file list
        } catch (err) {
            console.error("Failed to delete files:", err);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
                Authenticated as: {auth.user?.username}
            </h2>

            <div className="mb-4">
                <h3 className="font-semibold">Existing files:</h3>
                <div className="flex flex-col gap-4 mt-2">
                    {files.map((file) => (
                        <div key={file.id} className="flex flex-row gap-4">
                            <p>{file.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                onClick={handleDelete}
            >
                Wipe App Data
            </button>
        </div>
    );
};

export default WipeApp;
