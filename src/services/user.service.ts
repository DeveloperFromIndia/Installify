import UserModel from "@/database/models/User";


class UserService {
    async start(telegramId: number) {
        const [user, created] = await UserModel.findOrCreate({
            where: { telegramId },
            defaults: { telegramId }
        });
    }
}

export default new UserService;