'use client';

import { Button, Card, Col, Empty, Row, Spin, Tag, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Plan {
	id: string;
	name: string;
	price: number;
	durationDays: number;
	storageLimit: number;
	description?: string;
}

interface Subscription {
	id: string;
	planId: string;
	isActive: boolean;
	startDate: string;
	endDate: string;
	plan: Plan;
}

export default function SubscriptionPage() {
	const router = useRouter();
	const [plans, setPlans] = useState<Plan[]>([]);
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

	useEffect(() => {
		fetchPlans();
		fetchSubscription();
	}, []);

	const fetchPlans = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/plans`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				},
			);

			if (!response.ok) throw new Error('Failed to fetch plans');

			const data = await response.json();
			setPlans(data);
		} catch (error) {
			message.error('Failed to load subscription plans');
			console.error(error);
		}
	};

	const fetchSubscription = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/current`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				setSubscription(data);
			}
		} catch (error) {
			console.error('Failed to fetch subscription:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCheckout = async (planId: string) => {
		setCheckoutLoading(planId);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/subscription/payment/checkout`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ planId }),
				},
			);

			if (!response.ok) {
				throw new Error('Failed to initiate checkout');
			}

			const checkoutData = await response.json();

			// Store checkout data in session storage for the checkout page
			sessionStorage.setItem(
				'checkoutData',
				JSON.stringify(checkoutData),
			);

			// Redirect to checkout page
			router.push('/payment/checkout');
		} catch (error) {
			message.error(
				error instanceof Error
					? error.message
					: 'Failed to initiate checkout',
			);
		} finally {
			setCheckoutLoading(null);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spin size="large" tip="Loading subscription plans..." />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>

			{subscription?.isActive && (
				<Card className="mb-8 bg-blue-50 border-blue-200">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="text-xl font-semibold mb-2">
								Current Subscription
							</h2>
							<p className="text-gray-600">
								Plan: <strong>{subscription.plan.name}</strong>
							</p>
							<p className="text-gray-600">
								Storage:{' '}
								<strong>
									{subscription.plan.storageLimit} GB
								</strong>
							</p>
							<p className="text-gray-600">
								Expires:{' '}
								<strong>
									{new Date(
										subscription.endDate,
									).toLocaleDateString()}
								</strong>
							</p>
						</div>
						<Tag color="green">Active</Tag>
					</div>
				</Card>
			)}

			{plans.length === 0 ? (
				<Empty description="No subscription plans available" />
			) : (
				<Row gutter={[24, 24]}>
					{plans.map((plan) => (
						<Col key={plan.id} xs={24} sm={12} lg={8}>
							<Card
								hoverable
								className="h-full flex flex-col"
								title={
									<div>
										<h3 className="text-xl font-bold">
											{plan.name}
										</h3>
										<p className="text-sm text-gray-500 mt-1">
											{plan.description}
										</p>
									</div>
								}
							>
								<div className="flex-1">
									<div className="mb-6">
										<p className="text-3xl font-bold text-blue-600">
											${plan.price}
										</p>
										<p className="text-gray-600 text-sm">
											for {plan.durationDays} days
										</p>
									</div>

									<div className="space-y-3 mb-6">
										<div className="flex items-center">
											<span className="text-gray-600">
												Storage:{' '}
												<strong>
													{plan.storageLimit} GB
												</strong>
											</span>
										</div>
										<div className="flex items-center">
											<span className="text-gray-600">
												Duration:{' '}
												<strong>
													{plan.durationDays} days
												</strong>
											</span>
										</div>
									</div>
								</div>

								<Button
									type={
										subscription?.planId === plan.id &&
										subscription?.isActive
											? 'default'
											: 'primary'
									}
									size="large"
									block
									loading={checkoutLoading === plan.id}
									disabled={
										subscription?.planId === plan.id &&
										subscription?.isActive
									}
									onClick={() => handleCheckout(plan.id)}
								>
									{subscription?.planId === plan.id &&
									subscription?.isActive
										? 'Current Plan'
										: 'Subscribe Now'}
								</Button>
							</Card>
						</Col>
					))}
				</Row>
			)}
		</div>
	);
}
