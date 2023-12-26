export interface IServerData {
    type: string
    lang: string
    isMobileBrowser: boolean
    data: IData
  }

export interface IData {
    appKey: string
    shortKey: string
    csrfToken: string
    checksum: string
    receiver: IReceiver
    preview: IPreview
    me: IMe
    friends: IFriend[]
    chats: IChat[]
}

export interface IReceiver {
    id: string
    title: string
    member_count: number
    display_member_images: string[]
    chat_room_type: string
}

export interface IPreview {
    title: string
    description: string
    did: string
    service_name: string
    service_icon: string
}

export interface IMe {
    id: string
    profile_nickname: string
    profile_thumbnail_image: string
}

export interface IFriend {
    id: string
    profile_nickname: string
    profile_thumbnail_image: string
    favorite: boolean
}

export interface IChat {
    id: string
    title: string
    member_count: number
    display_member_images: string[]
    chat_room_type: string
}
