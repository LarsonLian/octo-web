import WKSDK, { Channel, ChannelTypeGroup } from "wukongimjssdk";
import WKApp from "../App";
import { ChannelTypeCommunityTopic, SubscriberStatus } from "../Service/Const";
import { parseThreadChannelId } from "../Service/Thread";

const GroupStatusDisband = 2;

/**
 * 判断当前登录用户是否已不在指定群/子区中（主动退出、被踢出或群被解散）。
 *
 * 判断顺序（任一成立即视为已离开）：
 *   1. 群已解散（isConversationDisbanded）——历史保留但全员只读，按产品约定视为已离开。
 *   2. 成员缓存存在（syncSubscribes 已完成过），但当前用户 uid 不在 normal 成员列表里
 *      ——对应被踢/主动退群后收到的 memberUpdate/removeMembers 推送触发的同步。
 *
 * 缓存未命中（从未同步过成员）时 fail-open 返回 false，避免启动时短暂误删会话。
 */
export function isSelfNoLongerInGroup(channel?: Channel | null): boolean {
  if (!channel) return false;

  let groupChannel: Channel | null = null;
  if (channel.channelType === ChannelTypeGroup) {
    groupChannel = channel;
  } else if (channel.channelType === ChannelTypeCommunityTopic) {
    const parsed = parseThreadChannelId(channel.channelID);
    if (!parsed) return false;
    groupChannel = new Channel(parsed.groupNo, ChannelTypeGroup);
  } else {
    return false;
  }

  // 1. 群已解散：保留历史但会话从最近列表移除。
  const info = WKSDK.shared().channelManager.getChannelInfo(groupChannel);
  if (info?.orgData?.status === GroupStatusDisband) {
    return true;
  }

  // 2. 成员缓存中找不到自己（且缓存非空，避免 sync 前误判）
  const subscribers = WKSDK.shared().channelManager.getSubscribes(
    groupChannel
  ) as Array<{ uid: string; status?: number; isDeleted?: boolean }> | null;
  if (subscribers && subscribers.length > 0) {
    const selfUID = WKApp.loginInfo.uid;
    const selfInGroup = subscribers.some(
      (s) =>
        s.uid === selfUID &&
        s.status === SubscriberStatus.normal &&
        !s.isDeleted
    );
    if (!selfInGroup) {
      return true;
    }
  }

  return false;
}
