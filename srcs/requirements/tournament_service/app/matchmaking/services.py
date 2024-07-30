# services for our matchmaking app
# we need to implement the following logics:
	# create a tournament
	# update scores
	# determine the winner
	# a way to break ties
# we will use these services in our views

from .models import Tournament, Match, Player, Score
import datetime
import random
import datetime

# create a tournament - we chosed the round-robin format because it's easy to implement and more fair than a single-elimination format
# for n players in a round-robin tournament, there will be ((n-1) * n) / 2 matches.
def create_round_robin_matches(tournament):
    players = list(tournament.players.all())
    num_players = len(players)
    matches = []

    # Validate the number of players
    if num_players < 2 or num_players > 6:
        raise ValueError("The number of players must be between 2 and 6")
    print(f"Number of players: {num_players}") #debug
    
    # Generate all possible matches
    all_matches = [(players[i], players[j]) for i in range(num_players) for j in range(i + 1, num_players)]
    print(f"number of matches: {len(all_matches)}") #debug
    print(f"all matches: {all_matches}") #debug

    # Shuffle the matches to avoid consecutive matches for any player
    random.shuffle(all_matches)
    print(f"shuffled matches: {all_matches}") #debug

    # Create Match objects from the shuffled matches list
    round_number = 1
    for match in all_matches:
        match_obj = Match(
            tournament=tournament,
            match_date=datetime.datetime.now(),
            player1=match[0],
            player2=match[1],
            round=round_number
        )

        print(f"Match: {match_obj.player1.name} vs {match_obj.player2.name}") # debug

        matches.append(match_obj)
        round_number += 1
    
    Match.objects.bulk_create(matches)
    return matches



# update scores - we update the scores and wins count of the players after each match
def update_scores(match, winner_id):
    # Update the winner field in the match
    match.winner_id = winner_id
    match.save()

    # Update scores
    tournament = match.tournament
    player1 = match.player1
    player2 = match.player2

    # Get or create score entries for both players
    score1, _ = Score.objects.get_or_create(tournament=tournament, player=player1)
    score2, _ = Score.objects.get_or_create(tournament=tournament, player=player2)

    # Update total wins of both players
    if winner_id == player1.id:
        score1.wins += 1
    elif winner_id == player2.id:
        score2.wins += 1

    # Update total points of both players
    score1.points += match.points_player1
    score2.points += match.points_player2

    # Save the updated scores
    score1.save()
    score2.save()


    

# Determine the winner of the tournament with tie-breaking
def get_tournament_results(tournament):
    scores = Score.objects.filter(tournament=tournament).order_by('-wins', '-points')

    # if not scores.exists():
    #     return {'winner': None, 'ranking': []}
    
    # # Determine the top scores for tie-breaking
    # top_scores = scores.filter(wins=scores.first().wins)

    # if not top_scores:
    #     top_scores = score[0]
    
    # # If there are multiple top scores, order them by points
    # if len(top_scores) > 1:
    #     top_scores = top_scores.order_by('-points')
    # if len(top_scores) > 1:
    #     # If there are still multiple top scores, select a random winner
    #     top_scores = [top_scores[random.randint(0, len(top_scores) - 1)]]

    winner = scores.first().player 

    # Prepare the ranking list
    ranking = []
    for score in scores:
        ranking.append({
            'player': score.player.name,
            'wins': score.wins,
            'points': score.points
        })

    return {'winner': winner, 'ranking': ranking}