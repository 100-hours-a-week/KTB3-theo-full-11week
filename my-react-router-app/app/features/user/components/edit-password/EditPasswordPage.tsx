import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toastService, useToast } from "~/features/shared/hooks/toast/useToast";
import { ApiError } from "~/features/shared/lib/api/apiError";
import { requestEditPassword } from "~/features/shared/lib/api/user-api";
import { useUserContext } from "~/features/shared/lib/context/UserContext";
import { LOCAL_STORAGE_KEY } from "~/features/shared/lib/util/localstorage";

type EditPasswordFormValues = {
    password: string,
    passwordConfirm: string;
}

export function EditPaswordPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setUser } = useUserContext();

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isValid, isSubmitting },
    } = useForm<EditPasswordFormValues>({
        mode: "onChange"
    })

    const passwordValue = watch('password');
    const passwordConfirmValue = watch('passwordConfirm');

    const onSubmit = async (data: EditPasswordFormValues) => {
        const userId = Number(localStorage.getItem(LOCAL_STORAGE_KEY.CURRENT_USER_ID));

        if (!userId) {
            showToast({
                title: "유저 정보를 찾을 수 없습니다.",
                buttonTitle: "닫기",
                onClick() {
                    toastService.clear();
                }
            })
            return;
        }

        try {
            await requestEditPassword(userId, data.password.trim());


        } catch (error) {
            if (error instanceof ApiError) {
                showToast({
                    title: error.message,
                    buttonTitle: "닫기",
                    onClick() {
                        toastService.clear();
                    }
                })
            }
        }
    }
}