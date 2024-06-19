export const filterMessages = (messages, query) => {
    return messages.filter(message =>
        message.pseudo.toLowerCase().includes(query.toLowerCase())
    );
};

export const calculateTimeSinceLastMessage = (date) => {
    const currentDate = new Date();
    const lastMessageDate = new Date(date);
    const timeDifference = currentDate.getTime() - lastMessageDate.getTime();
    const minutes = Math.floor(timeDifference / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) {
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        if (years > 0) {
            return `${years} a`;
        } else if (months > 0) {
            return `${months} mo`;
        }
    } else if (days > 0) {
        return `${days} j`;
    } else if (hours > 0) {
        return `${hours} h`;
    } else if (minutes > 0) {
        return `${minutes} m`;
    } else {
        return 'Just now';
    }
};
