<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\BarProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BarProductRefillNotification extends Notification
{
    use Queueable;

    public function __construct(
        public BarProduct $product,
    ) {
    }

    public function via(object $notifiable): array
    {
        $pref = $notifiable->notification_preference;

        $channels = [];
        if ($pref->wantsApp()) {
            $channels[] = 'database';
            $channels[] = WebPushChannel::class;
        }
        if ($pref->wantsEmail()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Product bijna op: ' . $this->product->name)
            ->line('Het product "' . $this->product->name . '" is als bijna op gemarkeerd door een barmedewerker.')
            ->line('Gelieve dit product aan te vullen.')
            ->action('Bekijk in admin', url('/admin?section=aan-te-vullen'));
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'icon' => '📦',
            'title' => 'Product bijna op',
            'message' => $this->product->name . ' moet aangevuld worden.',
            'bar_product_id' => $this->product->id,
            'detail' => [
                'product_name' => $this->product->name,
                'body' => 'Het product "' . $this->product->name . '" is als bijna op gemarkeerd door een barmedewerker. Gelieve dit product aan te vullen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Product bijna op',
            'body' => $this->product->name . ' moet aangevuld worden.',
            'url' => '/admin?section=aan-te-vullen',
        ];
    }
}
