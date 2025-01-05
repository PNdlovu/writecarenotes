/**
 * @writecarenotes.com
 * @fileoverview Social media sharing buttons for marketing pages
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Social media sharing buttons component for marketing pages.
 * Supports sharing on major platforms with customizable appearance.
 */

'use client';

import { FC } from 'react';
import { Twitter, Facebook, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
  className?: string;
  onShare?: (platform: string) => void;
}

export const ShareButtons: FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  className = '',
  onShare
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform];
    if (platform === 'email') {
      window.location.href = link;
    } else if (platform === 'whatsapp' && /mobile/i.test(navigator.userAgent)) {
      window.location.href = link;
    } else {
      window.open(link, '_blank', 'width=600,height=400');
    }
    onShare?.(platform);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white"
        onClick={() => handleShare('twitter')}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-[#4267B2] hover:bg-[#4267B2] hover:text-white"
        onClick={() => handleShare('facebook')}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-[#0077B5] hover:bg-[#0077B5] hover:text-white"
        onClick={() => handleShare('linkedin')}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-[#25D366] hover:bg-[#25D366] hover:text-white"
        onClick={() => handleShare('whatsapp')}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-gray-600 hover:bg-gray-600 hover:text-white"
        onClick={() => handleShare('email')}
        aria-label="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </Button>
    </div>
  );
} 