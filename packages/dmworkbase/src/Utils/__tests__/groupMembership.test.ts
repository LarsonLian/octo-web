import { beforeEach, describe, expect, it, vi } from "vitest";

const channelManager = vi.hoisted(() => ({
  getChannelInfo: vi.fn(),
  getSubscribes: vi.fn(),
}));

const loginInfo = vi.hoisted(() => ({ uid: "self-uid" }));
const appShared = vi.hoisted(() => ({ loginInfo }));

vi.mock("wukongimjssdk", () => {
  const ChannelTypePerson = 1;
  const ChannelTypeGroup = 2;
  const ChannelTypeCommunityTopic = 7;
  class Channel {
    channelID: string;
    channelType: number;
    constructor(channelID: string, channelType: number) {
      this.channelID = channelID;
      this.channelType = channelType;
    }
  }
  const sdk = { shared: () => ({ channelManager }) };
  return {
    default: sdk,
    WKSDK: sdk,
    Channel,
    ChannelTypePerson,
    ChannelTypeGroup,
    ChannelTypeCommunityTopic,
  };
});

vi.mock("../../App", () => ({
  default: appShared,
}));

import { Channel, ChannelTypeGroup } from "wukongimjssdk";
import { ChannelTypeCommunityTopic, SubscriberStatus } from "../../Service/Const";
import { buildThreadChannelId } from "../../Service/Thread";
import { isSelfNoLongerInGroup } from "../groupMembership";

describe("isSelfNoLongerInGroup", () => {
  beforeEach(() => {
    channelManager.getChannelInfo.mockReset();
    channelManager.getSubscribes.mockReset();
  });

  it("returns false for null/undefined channel", () => {
    expect(isSelfNoLongerInGroup(null)).toBe(false);
    expect(isSelfNoLongerInGroup(undefined)).toBe(false);
  });

  it("returns false for person channels", () => {
    expect(
      isSelfNoLongerInGroup(new Channel("u1", 1 /* ChannelTypePerson */))
    ).toBe(false);
  });

  it("returns true when group is disbanded (status===2)", () => {
    channelManager.getChannelInfo.mockReturnValue({
      orgData: { status: 2 },
    });
    channelManager.getSubscribes.mockReturnValue([]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      true
    );
  });

  it("returns false when subscriber cache is empty (never synced) - fail-open", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      false
    );
  });

  it("returns false when self is in normal subscribers list", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([
      { uid: "other", status: SubscriberStatus.normal, isDeleted: false },
      { uid: "self-uid", status: SubscriberStatus.normal, isDeleted: false },
    ]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      false
    );
  });

  it("returns true when self is NOT in subscribers list (kicked/left)", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([
      { uid: "other-a", status: SubscriberStatus.normal, isDeleted: false },
      { uid: "other-b", status: SubscriberStatus.normal, isDeleted: false },
    ]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      true
    );
  });

  it("returns true when self is marked isDeleted in subscribers", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([
      { uid: "self-uid", status: SubscriberStatus.normal, isDeleted: true },
    ]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      true
    );
  });

  it("returns true when self has blacklist status", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([
      {
        uid: "self-uid",
        status: SubscriberStatus.blacklist,
        isDeleted: false,
      },
    ]);
    expect(isSelfNoLongerInGroup(new Channel("g1", ChannelTypeGroup))).toBe(
      true
    );
  });

  it("topic channel: checks parent group subscribers", () => {
    channelManager.getChannelInfo.mockImplementation((ch: Channel) => {
      if (ch.channelID === "g1" && ch.channelType === ChannelTypeGroup) {
        return { orgData: { status: 1 } };
      }
      return undefined;
    });
    channelManager.getSubscribes.mockImplementation((ch: Channel) => {
      if (ch.channelID === "g1" && ch.channelType === ChannelTypeGroup) {
        return [
          { uid: "other", status: SubscriberStatus.normal, isDeleted: false },
        ];
      }
      return [];
    });
    const topicId = buildThreadChannelId("g1", "t1");
    expect(
      isSelfNoLongerInGroup(new Channel(topicId, ChannelTypeCommunityTopic))
    ).toBe(true);
  });

  it("topic channel: returns false when self in parent group", () => {
    channelManager.getChannelInfo.mockReturnValue({ orgData: { status: 1 } });
    channelManager.getSubscribes.mockReturnValue([
      { uid: "self-uid", status: SubscriberStatus.normal, isDeleted: false },
    ]);
    const topicId = buildThreadChannelId("g1", "t1");
    expect(
      isSelfNoLongerInGroup(new Channel(topicId, ChannelTypeCommunityTopic))
    ).toBe(false);
  });
});
