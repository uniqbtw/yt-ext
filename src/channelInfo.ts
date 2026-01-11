import { request } from "undici";
import { cookieJar } from "./cookies";
import {
    UndiciRequestOptions,
    assertUndiciOkResponse,
    constants,
    contentBetween,
    mergeObj,
    parseYoutubeKeywords,
} from "./utils";

export interface ChannelInfoOptions {
    requestOptions?: UndiciRequestOptions;
    includeVideos?: boolean;
}

export interface ChannelVideo {
    title: string;
    id: string;
    url: string;
    thumbnail: string;
    duration: {
        text: string;
        seconds: number;
    };
    views: string;
}
export interface ChannelShorts {
    title: string;
    id: string;
    url: string;
    thumbnail: string;
    duration: {
        text: string;
        seconds: number;
    };
    views: string;
}

export interface ChannelInfo {
    name: string;
    id: string;
    url: string;
    rssUrl: string;
    vanityUrl: string;
    description: string;
    subscribers: string;
    thumbnails: string;
    firstLink: string;
    banner: string;
    tags: string[];
    videosCount: number;
    videos: ChannelVideo[];
    shorts: ChannelShorts[];
    unlisted: boolean;
    familySafe: boolean;
}

/**
 * Get full information about a YouTube channel.
 */
export const channelInfo = async (
    url: string,
    options: ChannelInfoOptions = {}
) => {
    if (typeof url !== "string") {
        throw new Error(constants.errors.type("url", "string", typeof url));
    }
    if (typeof options !== "object") {
        throw new Error(
            constants.errors.type("options", "object", typeof options)
        );
    }

    options = mergeObj(
        {
            includeVideos: true,
        },
        options
    );
    if (!url.startsWith("http")) {
        url = constants.urls.channel.base(url);
    }

    let data: string;
    try {
        const resp = await request(url, options.requestOptions);
        assertUndiciOkResponse(resp);
        data = await resp.body.text();
        cookieJar.utilizeResponseHeaders(resp.headers);
    } catch (err) {
        throw new Error(`Failed to fetch url "${url}". (${err})`);
    }

    let initialData: any;
    try {
        const raw = contentBetween(data, "var ytInitialData = ", ";</script>");
        initialData = JSON.parse(raw);
    } catch (err) {
        throw new Error(`Failed to parse data from webpage. (${err})`);
    }

    const bannerCount =
        initialData?.header.pageHeaderRenderer.content.pageHeaderViewModel
            .banner.imageBannerViewModel.image.sources.length;
    const channel: ChannelInfo = {
        name: initialData?.metadata?.channelMetadataRenderer?.title,
        id: initialData?.metadata?.channelMetadataRenderer?.externalId,
        url: initialData?.metadata?.channelMetadataRenderer?.channelUrl,
        rssUrl: initialData?.metadata?.channelMetadataRenderer?.rssUrl,
        vanityUrl:
            initialData?.header.pageHeaderRenderer.content.pageHeaderViewModel
                .metadata.contentMetadataViewModel.metadataRows[0]
                .metadataParts[0].text.content,
        description:
            initialData?.metadata?.channelMetadataRenderer?.description,
        subscribers:
            initialData?.header.pageHeaderRenderer.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[1].metadataParts[0].accessibilityLabel.split(
                " "
            )[0],
        firstLink:
            initialData?.header.pageHeaderRenderer.content.pageHeaderViewModel
                .attribution.attributionViewModel.text.content,
        banner: initialData?.header.pageHeaderRenderer.content
            .pageHeaderViewModel.banner.imageBannerViewModel.image.sources[
            bannerCount - 1
        ].url,
        thumbnails:
            initialData?.metadata?.channelMetadataRenderer.avatar?.thumbnails[0]
                .url,
        tags: parseYoutubeKeywords(
            initialData?.metadata?.channelMetadataRenderer?.keywords ?? ""
        ),
        videosCount:
            initialData?.header.pageHeaderRenderer.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[1].metadataParts[1].text.content.split(
                " "
            )[0],
        videos: [],
        shorts: [],
        unlisted: initialData?.microformat?.microformatDataRenderer?.unlisted,
        familySafe:
            initialData?.metadata?.channelMetadataRenderer?.isFamilySafe,
    };

    if (options.includeVideos) {
        initialData?.contents?.twoColumnBrowseResultsRenderer?.tabs
            ?.find((x: any) => x?.tabRenderer?.title === "Videos")
            ?.tabRenderer?.content?.richGridRenderer?.contents?.forEach(
                (item: any) => {
                    const value =
                        item?.richItemRenderer?.content?.videoRenderer;
                    const duration = value?.lengthText?.simpleText;
                    let seconds;
                    if (
                        value?.lengthText?.simpleText.split(":").map(Number)
                            .length === 3
                    ) {
                        seconds =
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[0] *
                                3600 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[1] *
                                60 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[2];
                    } else {
                        seconds =
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[0] *
                                60 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[1];
                    }
                    const video: ChannelVideo = {
                        title: value?.title?.runs[0].text,
                        id: value?.videoId,
                        url: `https://youtu.be/${value?.videoId}`,
                        thumbnail:
                            value?.thumbnail?.thumbnails[
                                value?.thumbnail?.thumbnails.length - 1
                            ].url,
                        duration: {
                            text: duration,
                            seconds: seconds,
                        },
                        views: value?.viewCountText?.simpleText.split(" ")[0],
                    };
                    channel.videos.push(video);
                }
            );

        initialData?.contents?.twoColumnBrowseResultsRenderer?.tabs
            ?.find((x: any) => x?.tabRenderer?.title === "Shorts")
            ?.tabRenderer?.content?.richGridRenderer?.contents?.forEach(
                (item: any) => {
                    const value =
                        item?.richItemRenderer?.content?.videoRenderer;
                    const duration = value?.lengthText?.simpleText;
                    let seconds;
                    if (
                        value?.lengthText?.simpleText.split(":").map(Number)
                            .length === 3
                    ) {
                        seconds =
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[0] *
                                3600 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[1] *
                                60 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[2];
                    } else {
                        seconds =
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[0] *
                                60 +
                            value?.lengthText?.simpleText
                                .split(":")
                                .map(Number)[1];
                    }
                    const shorts: ChannelVideo = {
                        title: value?.title?.runs[0].text,
                        id: value?.videoId,
                        url: `https://youtu.be/${value?.videoId}`,
                        thumbnail:
                            value?.thumbnail?.thumbnails[
                                value?.thumbnail?.thumbnails.length - 1
                            ].url,
                        duration: {
                            text: duration,
                            seconds: seconds,
                        },
                        views: value?.viewCountText?.simpleText.split(" ")[0],
                    };
                    channel.videos.push(shorts);
                }
            );
    }
    console.log(channel);
    return initialData;
};

export default channelInfo;
