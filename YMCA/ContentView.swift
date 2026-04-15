//
//  ContentView.swift
//  YMCA
//
//  Created by Giovanni Fioroni on 26/03/2026.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 0) {
            topBar

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    heroSection
                    communityPulse
                    featuredSection
                    venuesSection
                    pathwaysSection
                    insightSection
                    howItWorksSection
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 24)
            }

            tabBar
        }
        .background(Color(.systemGroupedBackground))
    }

    private var topBar: some View {
        HStack {
            Spacer()

            Text("Oulm")
                .font(.title2)
                .fontWeight(.semibold)

            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
    }

    private var heroSection: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 28)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.blue.opacity(0.35),
                            Color.purple.opacity(0.25),
                            Color.black.opacity(0.15)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 240)

            VStack(alignment: .leading, spacing: 10) {
                Text("Herts / Beds / Bucks")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)

                Text("A softer way\nto show up.")
                    .font(.system(size: 30, weight: .bold))
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.leading)
            }
            .padding(24)
        }
    }

    private var communityPulse: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Community Pulse")
                .font(.headline)

            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.systemBackground))
                .frame(height: 90)
                .overlay(
                    HStack(spacing: 16) {
                        pulseItem(number: "128", label: "Members")
                        pulseItem(number: "14", label: "This week")
                        pulseItem(number: "9", label: "Venues")
                    }
                    .padding()
                )
        }
    }

    private var featuredSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader(title: "Featured", actionText: "All events")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    cardView(
                        eyebrow: "Featured Event",
                        title: "Community Sketch Club",
                        description: "A relaxed creative meetup for drawing, chatting, and showing up."
                    )

                    cardView(
                        eyebrow: "Featured Event",
                        title: "Build Night",
                        description: "A casual evening for making, testing, and sharing ideas together."
                    )

                    cardView(
                        eyebrow: "Featured Event",
                        title: "Film Screening",
                        description: "Low-pressure social space with a screening and discussion."
                    )
                }
            }
        }
    }

    private var venuesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader(title: "Venues", actionText: "County map")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    cardView(
                        eyebrow: "Venue",
                        title: "Oulm Homebase",
                        description: "Warm, familiar, and easy to enter for first-time attendance."
                    )

                    cardView(
                        eyebrow: "Venue",
                        title: "Bedford Makers Room",
                        description: "Flexible setup for creative sessions, tools, and workshops."
                    )

                    cardView(
                        eyebrow: "Venue",
                        title: "High Wycombe Forum",
                        description: "A wider community setting for events and shared activity."
                    )
                }
            }
        }
    }

    private var pathwaysSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionHeader(title: "Pathways", actionText: "All partners")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    cardView(
                        eyebrow: "Partner",
                        title: "Creative Pathways",
                        description: "Routes into collaboration, making, and local participation."
                    )

                    cardView(
                        eyebrow: "Partner",
                        title: "Skills Network",
                        description: "Support for learning, skill-building, and confidence."
                    )

                    cardView(
                        eyebrow: "Partner",
                        title: "Community Mentors",
                        description: "Trusted people helping attendance feel more human."
                    )
                }
            }
        }
    }

    private var insightSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("The insight")
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)

            Text("“The primary barrier is not technical friction. It is the psychological anxiety of showing up.”")
                .font(.body)
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.black.opacity(0.85))
                .cornerRadius(18)

            HStack(spacing: 12) {
                Button(action: {}) {
                    Text("Progress")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }

                Button(action: {}) {
                    Text("Host")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                        )
                        .foregroundColor(.primary)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(22)
    }

    private var howItWorksSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How it works")
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)

            Text("Attendance becomes possible when entry feels human.")
                .font(.title3)
                .fontWeight(.semibold)

            VStack(spacing: 14) {
                infoCard(
                    eyebrow: "01 — Homebase",
                    title: "Start from a place, not a signup wall.",
                    description: "The cafe-HQ grounds the experience in locality and warmth."
                )

                infoCard(
                    eyebrow: "02 — Activation",
                    title: "Events carry the social load.",
                    description: "Food runs, build nights, screenings, and interest hangs."
                )

                infoCard(
                    eyebrow: "03 — Longer arc",
                    title: "Participation becomes proof.",
                    description: "Verified hours, host points, and project signals."
                )
            }
        }
    }

    private var tabBar: some View {
        HStack {
            tabItem(icon: "house.fill", label: "Home")
            tabItem(icon: "calendar", label: "Events")
            tabItem(icon: "map", label: "Map")
            tabItem(icon: "plus.circle", label: "Host")
            tabItem(icon: "chart.bar", label: "Progress")
        }
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
    }

    private func pulseItem(number: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(number)
                .font(.title3)
                .fontWeight(.bold)

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private func sectionHeader(title: String, actionText: String) -> some View {
        HStack {
            Text(title)
                .font(.headline)

            Spacer()

            Button(action: {}) {
                Text(actionText)
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
        }
    }

    private func cardView(eyebrow: String, title: String, description: String) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(eyebrow)
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)

            Text(title)
                .font(.headline)

            Text(description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .frame(width: 250, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(20)
    }

    private func infoCard(eyebrow: String, title: String, description: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(eyebrow)
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)

            Text(title)
                .font(.headline)

            Text(description)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(18)
    }

    private func tabItem(icon: String, label: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
            Text(label)
                .font(.caption2)
        }
        .frame(maxWidth: .infinity)
        .foregroundColor(.primary)
    }
}

#Preview {
    ContentView()
}
