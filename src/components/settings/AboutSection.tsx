import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  Github,
  Globe,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { getVersion } from "@tauri-apps/api/app";
import { settingsApi } from "@/lib/api";
import { useUpdate } from "@/contexts/UpdateContext";
import { useSaveSettingsMutation, useSettingsQuery } from "@/lib/query";
import { compareVersions, toPublicVersion } from "@/lib/version";
import { Badge } from "@/components/ui/badge";
import { WhatsNewDialog } from "@/components/WhatsNewDialog";
import { WHATS_NEW_ENTRIES, entriesUpTo } from "@/lib/whatsNew";
import ccswitchLogo from "@/assets/icons/logo.svg";
import { extractErrorMessage } from "@/utils/errorUtils";

interface AboutSectionProps {
  isPortable: boolean;
}

// 应用自身版本（getVersion，本地毫秒级、无网络）也缓存一份，纯为重挂时免去 loading 闪烁。
let appVersionCache: string | null = null;

// 邀 Star 条关掉后记在本机（纯界面偏好，不进库、不随云同步）
const STAR_PROMPT_DISMISSED_KEY = "ccswitch:about:starPromptDismissed";

// 官方版本只用于同步提醒，缓存 6 小时，避免每次打开关于页都请求
const OFFICIAL_VERSION_CACHE_KEY = "ccswitch:about:officialVersion";
const OFFICIAL_VERSION_CHECKED_AT_KEY =
  "ccswitch:about:officialVersionCheckedAt";
const OFFICIAL_VERSION_TTL_MS = 6 * 60 * 60 * 1000;

function readCachedOfficialVersion(): string | null {
  try {
    const version = localStorage.getItem(OFFICIAL_VERSION_CACHE_KEY);
    const checkedAt = Number(
      localStorage.getItem(OFFICIAL_VERSION_CHECKED_AT_KEY) ?? "0",
    );
    if (version && Date.now() - checkedAt < OFFICIAL_VERSION_TTL_MS) {
      return version;
    }
  } catch {
    // localStorage 不可用时忽略缓存
  }
  return null;
}

function readStarPromptDismissed(): boolean {
  try {
    return localStorage.getItem(STAR_PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * 设置 → 关于：版本、便携模式、检查更新 / 安装并重启、项目链接。
 * 命令行应用的安装与升级在侧栏「应用」页。
 */
export function AboutSection({ isPortable }: AboutSectionProps) {
  const { t } = useTranslation();
  // 惰性初始化自模块缓存：重挂时首帧即渲染上次的值，避免 loading 闪烁；首次挂载缓存
  // 为空则回退到原始初值（null / loading）。
  const [version, setVersion] = useState<string | null>(() => appVersionCache);
  const [isLoadingVersion, setIsLoadingVersion] = useState(
    () => appVersionCache === null,
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [starPromptDismissed, setStarPromptDismissed] = useState(
    readStarPromptDismissed,
  );
  const recentEntries = useMemo(
    () =>
      version ? entriesUpTo(WHATS_NEW_ENTRIES, toPublicVersion(version)) : [],
    [version],
  );

  const { hasUpdate, updateInfo, checkUpdate, resetDismiss, isChecking } =
    useUpdate();

  const { data: settings } = useSettingsQuery();
  const saveSettings = useSaveSettingsMutation();
  const [officialVersion, setOfficialVersion] = useState<string | null>(
    readCachedOfficialVersion,
  );
  const [showMaintenance, setShowMaintenance] = useState(false);
  const versionClickCount = useRef(0);
  const officialPromptEnabled = settings?.officialUpdatePromptEnabled ?? true;
  const baseVersion = useMemo(
    () => (version ? version.split("-")[0] : ""),
    [version],
  );
  const officialBehind = useMemo(
    () =>
      Boolean(
        officialVersion &&
          baseVersion &&
          compareVersions(officialVersion, baseVersion) > 0,
      ),
    [baseVersion, officialVersion],
  );

  useEffect(() => {
    let active = true;
    const loadAppVersion = async () => {
      try {
        const appVersion = await getVersion();
        appVersionCache = appVersion;
        if (active) {
          setVersion(appVersion);
        }
      } catch (error) {
        console.error("[AboutSection] Failed to load app version", error);
        if (active) {
          setVersion(null);
        }
      } finally {
        if (active) {
          setIsLoadingVersion(false);
        }
      }
    };

    void loadAppVersion();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let checkedAt = 0;
    try {
      checkedAt = Number(
        localStorage.getItem(OFFICIAL_VERSION_CHECKED_AT_KEY) ?? "0",
      );
    } catch {
      // localStorage 不可用时每次都检查
    }
    if (Date.now() - checkedAt < OFFICIAL_VERSION_TTL_MS) {
      return;
    }

    settingsApi
      .getOfficialLatestVersion()
      .then((latest) => {
        if (!active || !latest) return;
        setOfficialVersion(latest);
        try {
          localStorage.setItem(OFFICIAL_VERSION_CACHE_KEY, latest);
          localStorage.setItem(
            OFFICIAL_VERSION_CHECKED_AT_KEY,
            String(Date.now()),
          );
        } catch {
          // 缓存失败不影响显示
        }
      })
      .catch((error) => {
        console.error("[AboutSection] Failed to check official version", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenReleaseNotes = useCallback(async () => {
    try {
      const targetVersion = updateInfo?.availableVersion ?? version ?? "";
      const publicTarget = toPublicVersion(targetVersion.replace(/^v/, ""));
      const tag = publicTarget ? `v${publicTarget}` : "";

      if (!tag) {
        await settingsApi.openExternal(
          "https://github.com/jlxzl/cc-switch/releases",
        );
        return;
      }

      await settingsApi.openExternal(
        `https://github.com/jlxzl/cc-switch/releases/tag/${tag}`,
      );
    } catch (error) {
      console.error("[AboutSection] Failed to open release notes", error);
      toast.error(t("settings.openReleaseNotesFailed"));
    }
  }, [t, updateInfo?.availableVersion, version]);

  const handleOpenGithub = useCallback(() => {
    void settingsApi.openExternal("https://github.com/jlxzl/cc-switch");
  }, []);

  const handleVersionClick = useCallback(() => {
    versionClickCount.current += 1;
    if (versionClickCount.current >= 7) {
      versionClickCount.current = 0;
      setShowMaintenance((visible) => !visible);
    }
  }, []);

  const handleToggleOfficialPrompt = useCallback(
    (checked: boolean) => {
      if (!settings) return;
      saveSettings.mutate(
        { ...settings, officialUpdatePromptEnabled: checked },
        {
          onError: (error) => {
            toast.error(t("common.error"), {
              description: extractErrorMessage(error) || undefined,
              closeButton: true,
            });
          },
        },
      );
    },
    [saveSettings, settings, t],
  );

  const handleDismissStarPrompt = useCallback(() => {
    setStarPromptDismissed(true);
    try {
      localStorage.setItem(STAR_PROMPT_DISMISSED_KEY, "1");
    } catch {
      // 存不下就只在本次会话里隐藏
    }
  }, []);

  const handleCheckUpdate = useCallback(async () => {
    if (hasUpdate) {
      if (isPortable) {
        try {
          await settingsApi.openPortableUpdateDownload(
            toPublicVersion(updateInfo?.availableVersion ?? ""),
          );
        } catch (error) {
          console.error("[AboutSection] Portable update failed", error);
        }
        return;
      }

      setIsDownloading(true);
      try {
        resetDismiss();
        const installed = await settingsApi.installUpdateAndRestart();
        if (!installed) {
          toast.success(t("settings.upToDate"), { closeButton: true });
        }
      } catch (error) {
        console.error("[AboutSection] Update failed", error);
        toast.error(t("settings.updateFailed"), {
          description: extractErrorMessage(error) || undefined,
          closeButton: true,
        });
        try {
          await settingsApi.checkUpdates();
        } catch (fallbackError) {
          console.error(
            "[AboutSection] Failed to open fallback updater",
            fallbackError,
          );
        }
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    try {
      const available = await checkUpdate();
      if (!available) {
        toast.success(t("settings.upToDate"), { closeButton: true });
      }
    } catch (error) {
      console.error("[AboutSection] Check update failed", error);
      toast.error(t("settings.checkUpdateFailed"), {
        description: extractErrorMessage(error) || undefined,
        closeButton: true,
      });
    }
  }, [
    checkUpdate,
    hasUpdate,
    isPortable,
    resetDismiss,
    t,
    updateInfo?.availableVersion,
  ]);

  const displayVersion = version
    ? toPublicVersion(version)
    : t("common.unknown");

  return (
    <div className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <img
          src={ccswitchLogo}
          alt=""
          draggable={false}
          className="h-10 w-10 shrink-0 p-1"
        />
        <div className="min-w-0 flex-1">
          <div className="text-title text-fg-1">CC Switch ZL</div>
          <div className="flex flex-wrap items-center gap-2 text-caption text-fg-2">
            {isLoadingVersion ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <span
                  className="cursor-default select-none tabular-nums"
                  onClick={handleVersionClick}
                >
                  {`${t("settings.zlVersion")} v${displayVersion}`}
                </span>
                <span className="tabular-nums">
                  {`${t("settings.officialVersion")} `}
                  {officialVersion
                    ? `v${officialVersion}`
                    : t("settings.officialVersionUnknown")}
                </span>
                {officialVersion && officialPromptEnabled && (
                  <Badge
                    variant="outline"
                    className={`gap-1 px-1.5 py-0 text-badge ${
                      officialBehind
                        ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                        : "text-fg-2"
                    }`}
                  >
                    {officialBehind
                      ? t("settings.officialVersionBehind")
                      : t("settings.officialVersionSynced")}
                  </Badge>
                )}
              </>
            )}
            {isPortable && (
              <Badge
                variant="secondary"
                className="gap-1 px-1.5 py-0 text-badge"
              >
                <Info className="h-3 w-3" />
                {t("settings.portableMode")}
              </Badge>
            )}
          </div>
          {showMaintenance && (
            <div className="mt-2 flex items-center gap-2 text-caption text-fg-2">
              <Checkbox
                id="official-update-prompt"
                checked={officialPromptEnabled}
                onCheckedChange={handleToggleOfficialPrompt}
                disabled={!settings || saveSettings.isPending}
              />
              <label
                htmlFor="official-update-prompt"
                className="cursor-pointer select-none"
              >
                {t("settings.officialPromptLabel")}
              </label>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant={hasUpdate ? "solid" : "neutral"}
          size="regular"
          onClick={handleCheckUpdate}
          disabled={isChecking || isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("settings.updating")}
            </>
          ) : hasUpdate ? (
            <>
              <Download className="h-3.5 w-3.5" />
              {t("settings.updateTo", {
                version: toPublicVersion(updateInfo?.availableVersion ?? ""),
              })}
            </>
          ) : isChecking ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {t("settings.checking")}
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              {t("settings.checkForUpdates")}
            </>
          )}
        </Button>
      </div>

      {hasUpdate && updateInfo && (
        <div className="space-y-1 px-5 py-4 text-body">
          <p className="font-medium text-fg-1">
            {t("settings.updateAvailable", {
              version: toPublicVersion(updateInfo.availableVersion),
            })}
          </p>
          {updateInfo.notes && (
            <p className="line-clamp-3 text-fg-2">{updateInfo.notes}</p>
          )}
          {isPortable && (
            <p className="text-fg-2">{t("settings.portableUpdateHint")}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-5 py-4">
        {starPromptDismissed && (
          <Button
            type="button"
            variant="neutral"
            size="compact"
            onClick={handleOpenGithub}
          >
            <Github className="h-3.5 w-3.5" />
            {t("settings.github")}
          </Button>
        )}
        <Button
          type="button"
          variant="neutral"
          size="compact"
          onClick={() => settingsApi.openExternal("https://ccswitch.io")}
        >
          <Globe className="h-3.5 w-3.5" />
          {t("settings.officialWebsite")}
        </Button>
        <Button
          type="button"
          variant="neutral"
          size="compact"
          onClick={handleOpenReleaseNotes}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("settings.releaseNotes")}
        </Button>
        {recentEntries.length > 0 && (
          <Button
            type="button"
            variant="neutral"
            size="compact"
            onClick={() => setWhatsNewOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("whatsNew.recentTitle")}
          </Button>
        )}
      </div>

      {/* 更新走本仓库发布页，邀 Star 单独占一行；关掉后链接行补回 GitHub 按钮 */}
      {!starPromptDismissed && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-action-soft py-3.5 ps-5 pe-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Star
              aria-hidden="true"
              className="h-5 w-5 shrink-0 animate-[spin_6s_linear_infinite] fill-amber-500 text-amber-500 motion-reduce:animate-none"
            />
            <p className="min-w-0 text-body text-fg-1">
              {t("settings.starPrompt")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="neutral"
              size="compact"
              onClick={handleOpenGithub}
            >
              <Github className="h-3.5 w-3.5" />
              {t("settings.starOnGithub")}
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="icon-compact"
              onClick={handleDismissStarPrompt}
              aria-label={t("common.close")}
              title={t("common.close")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <WhatsNewDialog
        open={whatsNewOpen}
        onClose={() => setWhatsNewOpen(false)}
        entries={recentEntries}
      />
    </div>
  );
}
