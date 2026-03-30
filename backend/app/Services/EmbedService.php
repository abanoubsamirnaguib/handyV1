<?php

namespace App\Services;

class EmbedService
{
    private static function normalizeFacebookUrl(string $url): string
    {
        $normalized = html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5);

        if (preg_match('~<iframe[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>~i', $normalized, $iframeMatch)) {
            $normalized = html_entity_decode($iframeMatch[1], ENT_QUOTES | ENT_HTML5);
        }

        if (preg_match('~^https?://(?:www\.)?facebook\.com/plugins/video\.php~i', $normalized) && str_contains($normalized, '?')) {
            $parts = parse_url($normalized);
            if (!empty($parts['query'])) {
                parse_str($parts['query'], $query);
                if (!empty($query['href'])) {
                    return trim(urldecode($query['href']));
                }
            }
        }

        return $normalized;
    }

    public static function resolve(string $url): ?array
    {
        $url = trim($url);
        $facebookNormalized = self::normalizeFacebookUrl($url);

        if ($url === '') {
            return null;
        }

        if ($facebookNormalized !== $url && !empty($facebookNormalized)) {
            $url = $facebookNormalized;
        }

        if (preg_match('~(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'youtube',
                'embed_url' => "https://www.youtube.com/embed/{$id}",
                'embed_id' => $id,
                'thumbnail_url' => "https://img.youtube.com/vi/{$id}/hqdefault.jpg",
                'original_url' => $url,
            ];
        }

        if (preg_match('~vimeo\.com/(?:video/)?(\d+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'vimeo',
                'embed_url' => "https://player.vimeo.com/video/{$id}",
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~tiktok\.com/@[^/]+/video/(\d+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'tiktok',
                'embed_url' => "https://www.tiktok.com/embed/v2/{$id}",
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~(?:facebook\.com/watch/\?[^"\s]*\bv=|facebook\.com/video\.php\?[^"\s]*\bv=)([A-Za-z0-9._-]+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'facebook',
                'embed_url' => 'https://www.facebook.com/plugins/video.php?href=' . urlencode($url) . '&show_text=0',
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~facebook\.com/(?:[^/]+/)?videos?/([0-9]+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'facebook',
                'embed_url' => 'https://www.facebook.com/plugins/video.php?href=' . urlencode($url) . '&show_text=0',
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~facebook\.com/reel/([A-Za-z0-9._-]+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'facebook',
                'embed_url' => 'https://www.facebook.com/plugins/video.php?href=' . urlencode($url) . '&show_text=0',
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~facebook\.com/share/v/([A-Za-z0-9._-]+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'facebook',
                'embed_url' => 'https://www.facebook.com/plugins/video.php?href=' . urlencode($url) . '&show_text=0',
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        if (preg_match('~fb\.watch/([A-Za-z0-9_-]+)~i', $url, $matches)) {
            $id = $matches[1];

            return [
                'provider' => 'facebook',
                'embed_url' => 'https://www.facebook.com/plugins/video.php?href=' . urlencode($url) . '&show_text=0',
                'embed_id' => $id,
                'thumbnail_url' => null,
                'original_url' => $url,
            ];
        }

        return null;
    }
}
