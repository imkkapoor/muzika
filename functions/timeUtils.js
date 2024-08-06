export function timeAgo(timestamp) {
    const { seconds, nanoseconds } = timestamp;
    const past = new Date(seconds * 1000 + nanoseconds / 1000000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - past) / 1000);

    const intervals = [
        { label: "y", seconds: 31536000 },
        { label: "m", seconds: 2592000 },
        { label: "w", seconds: 604800 },
        { label: "d", seconds: 86400 },
        { label: "hr", seconds: 3600 },
        { label: "min", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return count === 1
                ? `${count}${interval.label}`
                : `${count}${interval.label}`;
        }
    }

    return "just now";
}