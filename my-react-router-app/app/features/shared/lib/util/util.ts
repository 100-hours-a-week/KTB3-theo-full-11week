import { regex } from './regex'

// 이메일 표현식 검증
export function isEmail(email: string) {
    return Boolean(regex.EMAIL.test(email));
}

// 패스워드 패턴 매칭 검사
export function isValidPasswordPattern(password: string) {
    return Boolean(regex.PASSWORD.test(password));
}

// 공백 여부 확인
export function isBlank(str: string) {
    return !str || str.trim().length === 0;
}

// 문자열 길이가 max를 넘는지
export function isOverMaxLength(str: string, max: number) {
    return str.length >= max;
}

// min <= str <= max
export function isBetweenLength(str: string, min: number, max: number) {
    return (str.length >= min) && (str.length <= max);
}

// 파일 여부 확인
export function isFile(file: File) {
    return file.type.startsWith('image/');
}

// 현재 날짜 시간 반환 : yyyy-mm-dd hh:mm:ss
export function getNowData() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}